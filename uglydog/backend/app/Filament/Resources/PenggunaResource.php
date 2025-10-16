<?php

namespace App\Filament\Resources;

use Filament\Forms;
use Filament\Tables;
use App\Models\Pengguna;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use App\Filament\Resources\PenggunaResource\Pages;
use App\Filament\Resources\WalletsResource\RelationManagers\WalletsRelationManager;

class PenggunaResource extends Resource
{
    protected static ?string $model = Pengguna::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationGroup = 'Data Management';

    protected static ?string $label = 'User';
    protected static ?string $pluralLabel = 'List User';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->label('Nama')
                ->required()
                ->maxLength(255),

            Forms\Components\TextInput::make('email')
                ->label('Email')
                ->required()
                ->email()
                ->maxLength(255)
                ->unique(ignoreRecord: true),

            Forms\Components\TextInput::make('password')
                ->label('Password')
                ->password()
                ->dehydrateStateUsing(fn ($state) => filled($state) ? bcrypt($state) : null)
                ->required(fn (string $context) => $context === 'create')
                ->visible(fn (string $context) => in_array($context, ['create', 'edit']))
                ->maxLength(255),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('index')
                ->label('No. ')
                ->rowIndex(),

            Tables\Columns\TextColumn::make('name')
                ->label('Nama')
                ->searchable()
                ->sortable(),

            Tables\Columns\TextColumn::make('email')
                ->label('Email')
                ->searchable()
                ->sortable(),

            TextColumn::make('gameProfile.total_score')
                ->label('Total Score')
                ->sortable()
                ->searchable()
                ->getStateUsing(function ($record) {
                    return $record->gameProfile->total_score ?? 0;
                })
                ->toggleable(),

            TextColumn::make('wallets.address')
    ->label('Wallet')
    ->searchable()
    ->toggleable()

        ])
            ->recordUrl(fn (Pengguna $record) => null)
            ->recordAction('walletPopup')
            ->filters([])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Action::make('walletPopup')
                    ->label('Lihat Wallet')
                    ->icon('heroicon-m-wallet')
                    ->modalHeading('Detail Wallet')
                    ->modalContent(fn ($record) => view('components.wallet-modal', [
                        'wallets' => $record->wallets,
                    ])),
            ])

            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make()->label('Hapus Massal'),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            WalletsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListPenggunas::route('/'),
            'create' => Pages\CreatePengguna::route('/create'),
            'edit'   => Pages\EditPengguna::route('/{record}/edit'),
            'view'   => Pages\ViewPengguna::route('/{record}'),
        ];
    }
}

