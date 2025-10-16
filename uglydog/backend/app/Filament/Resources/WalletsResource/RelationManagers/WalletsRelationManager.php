<?php

namespace App\Filament\Resources\WalletsResource\RelationManagers;

use Filament\Forms;
use Filament\Tables;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Resources\RelationManagers\RelationManager;

class WalletsRelationManager extends RelationManager
{
    protected static string $relationship = 'wallets';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('provider')
                ->label('Provider')
                ->required()
                ->maxLength(255),

            Forms\Components\TextInput::make('address')
                ->label('Alamat Wallet')
                ->required()
                ->maxLength(255)
                ->unique(ignoreRecord: true),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('provider')->label('Provider')->searchable(),
                Tables\Columns\TextColumn::make('address')
                    ->label('Alamat')
                    ->copyable()
                    ->icon('heroicon-o-clipboard'),
                Tables\Columns\TextColumn::make('created_at')->label('Ditambahkan')->dateTime('d M Y H:i'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }
}
