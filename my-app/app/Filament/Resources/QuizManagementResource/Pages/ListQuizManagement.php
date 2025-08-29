<?php

namespace App\Filament\Resources\QuizManagementResource\Pages;

use App\Filament\Resources\QuizManagementResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListQuizManagement extends ListRecords
{
    protected static string $resource = QuizManagementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Create New Quiz'),
        ];
    }
}
