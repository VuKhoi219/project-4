<?php

namespace App\Filament\Resources\CategoryManagementResource\Pages;

use App\Filament\Resources\CategoryManagementResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewCategoryManagement extends ViewRecord
{
    protected static string $resource = CategoryManagementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}