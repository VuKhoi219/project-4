<?php

namespace App\Filament\Resources\FinalResultResource\Pages;

use App\Filament\Resources\FinalResultResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFinalResults extends ListRecords
{
    protected static string $resource = FinalResultResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
