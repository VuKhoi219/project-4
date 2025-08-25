<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuizResource\Pages;
use App\Models\Quiz;
use App\Models\Category;
use App\Models\User;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;

class QuizResource extends Resource
{
    protected static ?string $model = Quiz::class;

    // Sửa tên icon từ 'heroicon-s:collection' thành 'heroicon-o-rectangle-stack'
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('description'),
                Forms\Components\Textarea::make('summary'),
                Forms\Components\Select::make('creator_id')
                    ->label('Creator')
                    ->relationship('creator', 'full_name')
                    ->required(),
                Forms\Components\Select::make('category_id')
                    ->relationship('category', 'name')
                    ->required(),
                Forms\Components\Select::make('source_type')
                    ->options([
                        'TEXT' => 'Text',
                        'PDF' => 'PDF',
                        'IMAGE' => 'Image',
                    ])
                    ->required(),
                Forms\Components\FileUpload::make('avatar'),
                Forms\Components\Select::make('file_id')
                    ->label('Uploaded File')
                    ->relationship('file', 'original_filename'),
            ]);
    }

    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('title')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('category.name')->label('Category')->sortable(),
                Tables\Columns\TextColumn::make('creator.full_name')->label('Creator')->sortable(),
                Tables\Columns\TextColumn::make('source_type')->sortable(),
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
            'index' => Pages\ListQuizzes::route('/'),
            'create' => Pages\CreateQuiz::route('/create'),
            'edit' => Pages\EditQuiz::route('/{record}/edit'),
        ];
    }
}