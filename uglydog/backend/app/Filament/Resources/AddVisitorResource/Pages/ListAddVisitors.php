<?php

namespace App\Filament\Resources\AddVisitorResource\Pages;

use App\Filament\Resources\AddVisitorResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAddVisitors extends ListRecords
{
    protected static string $resource = AddVisitorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
