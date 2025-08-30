<?php

namespace App\Filament\Resources\FinalResultManagementResource\Pages;

use App\Filament\Resources\FinalResultManagementResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFinalResultManagement extends ListRecords
{
    protected static string $resource = FinalResultManagementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // No create action as per requirements
        ];
    }
}