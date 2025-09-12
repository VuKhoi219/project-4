<?php

namespace App\Filament\Resources\PlayerResultResource\Pages;

use App\Filament\Resources\PlayerResultResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPlayerResult extends EditRecord
{
    protected static string $resource = PlayerResultResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
