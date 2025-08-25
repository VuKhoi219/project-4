<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FinalResultResource\Pages;
use App\Models\FinalResult;
use App\Models\User;
use App\Models\Quiz;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;

class FinalResultResource extends Resource
{
    protected static ?string $model = FinalResult::class;

    // Icon hiển thị trong menu Filament
    protected static ?string $navigationIcon = 'heroicon-o-check-badge';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name_player')
                    ->label('Player Name')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('points')
                    ->required()
                    ->numeric(),

                Forms\Components\Select::make('user_id')
                    ->label('User')
                    ->relationship('user', 'full_name')
                    ->required(),

                Forms\Components\Select::make('quiz_id')
                    ->label('Quiz')
                    ->relationship('quiz', 'title')
                    ->required(),
            ]);
    }

    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name_player')->label('Player Name')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('points')->sortable(),
                Tables\Columns\TextColumn::make('user.full_name')->label('User')->sortable(),
                Tables\Columns\TextColumn::make('quiz.title')->label('Quiz')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFinalResults::route('/'),
            'create' => Pages\CreateFinalResult::route('/create'),
            'edit' => Pages\EditFinalResult::route('/{record}/edit'),
        ];
    }
}
