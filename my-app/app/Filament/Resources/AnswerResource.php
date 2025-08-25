<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AnswerResource\Pages;
use App\Models\Answer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AnswerResource extends Resource
{
    protected static ?string $model = Answer::class;

    // Sửa tên icon từ 'heroicon-s:document-text' thành 'heroicon-o-document-text'
    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('question_id')
                    ->label('Question')
                    ->relationship('question', 'question_text')
                    ->required(),
                Forms\Components\Textarea::make('answer_text')
                    ->label('Answer Text')
                    ->required(),
                Forms\Components\Toggle::make('is_correct')
                    ->label('Is Correct'),
                Forms\Components\TextInput::make('order_index')
                    ->numeric()
                    ->required()
                    ->label('Order Index'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('question.question_text')
                    ->label('Question')
                    ->limit(50)
                    ->sortable(),
                Tables\Columns\TextColumn::make('answer_text')
                    ->label('Answer')
                    ->limit(50)
                    ->sortable()
                    ->searchable(),
                Tables\Columns\IconColumn::make('is_correct')
                    ->boolean()
                    ->label('Correct'),
                Tables\Columns\TextColumn::make('order_index')->sortable(),
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

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAnswers::route('/'),
            'create' => Pages\CreateAnswer::route('/create'),
            'edit' => Pages\EditAnswer::route('/{record}/edit'),
        ];
    }
}