<?php

namespace App\Filament\Resources\QuizManagementResource\Pages;

use App\Filament\Resources\QuizManagementResource;
use Filament\Resources\Pages\CreateRecord;

class CreateQuizManagement extends CreateRecord
{
    protected static string $resource = QuizManagementResource::class;
    
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
