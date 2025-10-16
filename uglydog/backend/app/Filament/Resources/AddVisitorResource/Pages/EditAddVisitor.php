<?php

namespace App\Filament\Resources\AddVisitorResource\Pages;

use App\Filament\Resources\AddVisitorResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAddVisitor extends EditRecord
{
    protected static string $resource = AddVisitorResource::class;

    protected function getHeaderActions(): array
    {
        return [
        ];
    }

    //customize redirect after create
    public function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
