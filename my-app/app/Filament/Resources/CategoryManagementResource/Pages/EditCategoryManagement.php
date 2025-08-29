<?php

namespace App\Filament\Resources\CategoryManagementResource\Pages;

use App\Filament\Resources\CategoryManagementResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCategoryManagement extends EditRecord
{
    protected static string $resource = CategoryManagementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
