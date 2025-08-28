use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount, mint_to, MintTo, transfer, Transfer},
};
use mpl_token_metadata::{
    instruction::{create_metadata_accounts_v3, create_master_edition_v3},
    state::{DataV2, Creator},
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Minting fee in lamports (0.006 SOL = 6,000,000 lamports)
const MINTING_FEE: u64 = 6_000_000;

#[program]
pub mod metalax_nft {
    use super::*;

    /// Initialize the Metalax platform with contract owner
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.owner = ctx.accounts.owner.key();
        platform.bump = ctx.bumps.platform;
        platform.total_minted = 0;
        platform.total_fees_collected = 0;
        
        msg!("Metalax NFT Platform initialized by owner: {}", platform.owner);
        Ok(())
    }

    /// Mint NFT with on-chain image storage and fee collection
    pub fn mint_nft(
        ctx: Context<MintNft>,
        name: String,
        symbol: String,
        uri: String,
        image_data: Vec<u8>, // On-chain image storage
        seller_fee_basis_points: u16,
    ) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        let payer = &ctx.accounts.payer;
        let owner = &ctx.accounts.platform_owner;

        // Validate input parameters
        require!(name.len() <= 32, MetalaxError::NameTooLong);
        require!(symbol.len() <= 10, MetalaxError::SymbolTooLong);
        require!(uri.len() <= 200, MetalaxError::UriTooLong);
        require!(image_data.len() <= 10_000, MetalaxError::ImageTooLarge); // 10KB limit for cost efficiency
        require!(seller_fee_basis_points <= 10000, MetalaxError::InvalidRoyalty);

        // Transfer minting fee from payer to platform owner
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: payer.to_account_info(),
            to: owner.to_account_info(),
        };
        
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                transfer_instruction,
            ),
            MINTING_FEE,
        )?;

        // Create the NFT metadata with embedded image data
        let nft_metadata = &mut ctx.accounts.nft_metadata;
        nft_metadata.mint = ctx.accounts.mint.key();
        nft_metadata.name = name.clone();
        nft_metadata.symbol = symbol.clone();
        nft_metadata.uri = uri;
        nft_metadata.image_data = image_data;
        nft_metadata.creator = payer.key();
        nft_metadata.owner = payer.key();
        nft_metadata.royalty_basis_points = seller_fee_basis_points;
        nft_metadata.bump = ctx.bumps.nft_metadata;

        // Mint token to the associated token account
        let seeds = &[
            b"metalax-platform",
            &[platform.bump],
        ];
        let signer = &[&seeds[..]];

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: platform.to_account_info(),
                },
                signer,
            ),
            1, // NFT has supply of 1
        )?;

        // Update platform statistics
        platform.total_minted += 1;
        platform.total_fees_collected += MINTING_FEE;

        msg!("NFT minted successfully: {} - Image size: {} bytes", name, nft_metadata.image_data.len());
        msg!("Minting fee collected: {} lamports", MINTING_FEE);
        
        Ok(())
    }

    /// Transfer NFT ownership
    pub fn transfer_nft(ctx: Context<TransferNft>) -> Result<()> {
        let nft_metadata = &mut ctx.accounts.nft_metadata;
        
        // Verify current owner
        require!(
            nft_metadata.owner == ctx.accounts.current_owner.key(),
            MetalaxError::NotNftOwner
        );

        // Transfer the token
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.from_token_account.to_account_info(),
                    to: ctx.accounts.to_token_account.to_account_info(),
                    authority: ctx.accounts.current_owner.to_account_info(),
                },
            ),
            1,
        )?;

        // Update metadata ownership
        nft_metadata.owner = ctx.accounts.new_owner.key();

        msg!("NFT transferred to new owner: {}", ctx.accounts.new_owner.key());
        Ok(())
    }

    /// Get image data from NFT metadata
    pub fn get_image_data(ctx: Context<GetImageData>) -> Result<Vec<u8>> {
        let nft_metadata = &ctx.accounts.nft_metadata;
        Ok(nft_metadata.image_data.clone())
    }

    /// Update platform settings (owner only)
    pub fn update_platform(ctx: Context<UpdatePlatform>, new_owner: Option<Pubkey>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        
        require!(
            platform.owner == ctx.accounts.current_owner.key(),
            MetalaxError::NotPlatformOwner
        );

        if let Some(owner) = new_owner {
            platform.owner = owner;
            msg!("Platform owner updated to: {}", owner);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 1 + 8 + 8, // discriminator + owner + bump + total_minted + total_fees_collected
        seeds = [b"metalax-platform"],
        bump
    )]
    pub platform: Account<'info, MetalaxPlatform>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(
        mut,
        seeds = [b"metalax-platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, MetalaxPlatform>,

    /// CHECK: Platform owner account for fee collection
    #[account(
        mut,
        constraint = platform_owner.key() == platform.owner @ MetalaxError::NotPlatformOwner
    )]
    pub platform_owner: AccountInfo<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = platform,
        mint::freeze_authority = platform,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 64 + 16 + 200 + 4 + 10000 + 32 + 32 + 2 + 1, // metadata fields + max image data
        seeds = [b"nft-metadata", mint.key().as_ref()],
        bump
    )]
    pub nft_metadata: Account<'info, NftMetadata>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferNft<'info> {
    #[account(
        mut,
        seeds = [b"nft-metadata", mint.key().as_ref()],
        bump = nft_metadata.bump
    )]
    pub nft_metadata: Account<'info, NftMetadata>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = current_owner,
    )]
    pub from_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = current_owner,
        associated_token::mint = mint,
        associated_token::authority = new_owner,
    )]
    pub to_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub current_owner: Signer<'info>,

    /// CHECK: New owner account
    pub new_owner: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct GetImageData<'info> {
    #[account(
        seeds = [b"nft-metadata", mint.key().as_ref()],
        bump = nft_metadata.bump
    )]
    pub nft_metadata: Account<'info, NftMetadata>,

    pub mint: Account<'info, Mint>,
}

#[derive(Accounts)]
pub struct UpdatePlatform<'info> {
    #[account(
        mut,
        seeds = [b"metalax-platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, MetalaxPlatform>,

    #[account(
        constraint = current_owner.key() == platform.owner @ MetalaxError::NotPlatformOwner
    )]
    pub current_owner: Signer<'info>,
}

#[account]
pub struct MetalaxPlatform {
    pub owner: Pubkey,
    pub bump: u8,
    pub total_minted: u64,
    pub total_fees_collected: u64,
}

#[account]
pub struct NftMetadata {
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub image_data: Vec<u8>, // On-chain image storage
    pub creator: Pubkey,
    pub owner: Pubkey,
    pub royalty_basis_points: u16,
    pub bump: u8,
}

#[error_code]
pub enum MetalaxError {
    #[msg("Name is too long (max 32 characters)")]
    NameTooLong,
    #[msg("Symbol is too long (max 10 characters)")]
    SymbolTooLong,
    #[msg("URI is too long (max 200 characters)")]
    UriTooLong,
    #[msg("Image data is too large (max 10KB for cost efficiency)")]
    ImageTooLarge,
    #[msg("Invalid royalty percentage (max 100%)")]
    InvalidRoyalty,
    #[msg("Not the NFT owner")]
    NotNftOwner,
    #[msg("Not the platform owner")]
    NotPlatformOwner,
}