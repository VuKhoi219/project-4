<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuestionResource\Pages;
use App\Models\Question;
use App\Models\Quiz;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class QuestionResource extends Resource
{
    protected static ?string $model = Question::class;

    // Sửa tên icon từ 'heroicon-s:document-text' thành 'heroicon-o-clipboard-document-list'
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('quiz_id')
                    ->label('Quiz')
                    ->relationship('quiz', 'title')
                    ->required(),
                Forms\Components\Textarea::make('question_text')
                    ->label('Question Text')
                    ->required(),
                Forms\Components\Select::make('question_type')
                    ->label('Question Type')
                    ->options([
                        'MULTIPLE_CHOICE' => 'Multiple Choice',
                        'TRUE_FALSE' => 'True / False',
                        'SHORT_ANSWER' => 'Short Answer',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('points')
                    ->numeric()
                    ->default(1000)
                    ->required(),
                Forms\Components\TextInput::make('order_index')
                    ->numeric()
                    ->required()
                    ->label('Order Index'),
                Forms\Components\TextInput::make('time_limit')
                    ->numeric()
                    ->label('Time Limit (seconds)'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('quiz.title')->label('Quiz')->sortable(),
                Tables\Columns\TextColumn::make('question_text')
                    ->label('Question')
                    ->limit(50)
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('question_type')->sortable(),
                Tables\Columns\TextColumn::make('points')->sortable(),
                Tables\Columns\TextColumn::make('order_index')->sortable(),
                Tables\Columns\TextColumn::make('time_limit')->label('Time Limit')->sortable(),
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
            // Nếu muốn quản lý answers của question, có thể thêm RelationManager sau
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListQuestions::route('/'),
            'create' => Pages\CreateQuestion::route('/create'),
            'edit' => Pages\EditQuestion::route('/{record}/edit'),
        ];
    }
}