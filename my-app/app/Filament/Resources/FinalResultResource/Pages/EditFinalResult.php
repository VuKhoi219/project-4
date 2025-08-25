<?php

namespace App\Filament\Resources\FinalResultResource\Pages;

use App\Filament\Resources\FinalResultResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFinalResult extends EditRecord
{
    protected static string $resource = FinalResultResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
