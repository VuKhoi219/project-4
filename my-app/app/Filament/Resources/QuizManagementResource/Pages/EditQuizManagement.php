<?php

namespace App\Filament\Resources\QuizManagementResource\Pages;

use App\Filament\Resources\QuizManagementResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditQuizManagement extends EditRecord
{
    protected static string $resource = QuizManagementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}
