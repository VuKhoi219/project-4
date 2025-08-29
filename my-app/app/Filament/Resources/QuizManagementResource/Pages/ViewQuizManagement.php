<?php

namespace App\Filament\Resources\QuizManagementResource\Pages;

use App\Filament\Resources\QuizManagementResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewQuizManagement extends ViewRecord
{
    protected static string $resource = QuizManagementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}