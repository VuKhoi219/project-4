<?php

namespace App\Filament\Resources\CategoryManagementResource\Pages;

use App\Filament\Resources\CategoryManagementResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCategoryManagement extends ListRecords
{
    protected static string $resource = CategoryManagementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Create New Quiz'),
        ];
    }
}
