<?php

namespace App\Filament\Resources\FinalResultManagementResource\Pages;

use App\Filament\Resources\FinalResultManagementResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFinalResultManagement extends EditRecord
{
    protected static string $resource = FinalResultManagementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
