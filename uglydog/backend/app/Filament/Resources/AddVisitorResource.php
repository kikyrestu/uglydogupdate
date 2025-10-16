<?php

namespace App\Filament\Resources;

use App\Models\AddVisitor;
use Filament\Forms;
use Filament\Tables;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Resources\Resource;
use App\Filament\Resources\AddVisitorResource\Pages;

class AddVisitorResource extends Resource
{
    protected static ?string $model = AddVisitor::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Add Visitors';
    protected static ?string $pluralModelLabel = 'Add Visitor';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('added_count')
                ->required()
                ->numeric()
                ->minValue(1),
            Forms\Components\Textarea::make('note')
                ->label('Catatan')
                ->rows(2)
                ->maxLength(255),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('index')->label('No. ')->rowIndex(),
            Tables\Columns\TextColumn::make('added_count')->label('Jumlah Ditambah'),
            Tables\Columns\TextColumn::make('note')->label('Catatan')->wrap(),
            Tables\Columns\TextColumn::make('created_at')->label('Dibuat')->dateTime('d M Y H:i'),
        ])
        ->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ])
        ->bulkActions([
            Tables\Actions\DeleteBulkAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAddVisitors::route('/'),
            'create' => Pages\CreateAddVisitor::route('/create'),
            'edit' => Pages\EditAddVisitor::route('/{record}/edit'),
        ];
    }
}
