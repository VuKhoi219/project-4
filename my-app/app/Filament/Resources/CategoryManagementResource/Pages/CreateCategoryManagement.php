<?php

namespace App\Filament\Resources\CategoryManagementResource\Pages;

use App\Filament\Resources\CategoryManagementResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCategoryManagement extends CreateRecord
{
    protected static string $resource = CategoryManagementResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
