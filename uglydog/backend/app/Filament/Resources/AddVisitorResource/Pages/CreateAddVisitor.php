<?php

namespace App\Filament\Resources\AddVisitorResource\Pages;

use App\Filament\Resources\AddVisitorResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateAddVisitor extends CreateRecord
{
    protected static string $resource = AddVisitorResource::class;
    protected static bool $canCreateAnother = false;

    //customize redirect after create
    public function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
