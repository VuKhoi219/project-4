<?php

namespace App\Filament\Resources\PlayerResultResource\Pages;

use App\Filament\Resources\PlayerResultResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewPlayerResult extends ViewRecord
{
    protected static string $resource = PlayerResultResource::class;

    protected function getHeaderActions(): array
    {
        return [
            
        ];
    }
}
