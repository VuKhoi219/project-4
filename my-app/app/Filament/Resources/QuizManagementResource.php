<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuizManagementResource\Pages;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Illuminate\Database\Eloquent\Builder;

class QuizManagementResource extends Resource
{
    protected static ?string $model = Quiz::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';
    
    protected static ?string $navigationLabel = 'Quiz Management';
    
    protected static ?string $modelLabel = 'Quiz Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Quiz Information')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Textarea::make('description')
                            ->rows(3),
                        Forms\Components\Textarea::make('summary')
                            ->rows(2),
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
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Questions & Answers')
                    ->schema([
                        Forms\Components\Repeater::make('questions')
                            ->relationship()
                            ->schema([
                                Forms\Components\Textarea::make('question_text')
                                    ->label('Question')
                                    ->required()
                                    ->rows(2),
                                Forms\Components\Select::make('question_type')
                                    ->label('Type')
                                    ->options([
                                        'MULTIPLE_CHOICE' => 'Multiple Choice',
                                        'TRUE_FALSE' => 'True / False',
                                        'SHORT_ANSWER' => 'Short Answer',
                                    ])
                                    ->required(),
                                Forms\Components\Grid::make(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('points')
                                            ->numeric()
                                            ->default(1000)
                                            ->required(),
                                        Forms\Components\TextInput::make('order_index')
                                            ->numeric()
                                            ->required()
                                            ->label('Order'),
                                        Forms\Components\TextInput::make('time_limit')
                                            ->numeric()
                                            ->label('Time Limit (s)'),
                                    ]),
                                Forms\Components\Repeater::make('answers')
                                    ->relationship()
                                    ->schema([
                                        Forms\Components\Textarea::make('answer_text')
                                            ->label('Answer')
                                            ->required()
                                            ->rows(1),
                                        Forms\Components\Toggle::make('is_correct')
                                            ->label('Correct Answer'),
                                        Forms\Components\TextInput::make('order_index')
                                            ->numeric()
                                            ->required()
                                            ->label('Order')
                                            ->default(1),
                                    ])
                                    ->columns(3)
                                    ->defaultItems(2)
                                    ->addActionLabel('Add Answer')
                                    ->collapsed(false)
                                    ->itemLabel(fn (array $state): ?string => $state['answer_text'] ?? 'New Answer'),
                            ])
                            ->collapsed(false)
                            ->itemLabel(fn (array $state): ?string => $state['question_text'] ?? 'New Question')
                            ->addActionLabel('Add Question')
                            ->defaultItems(1),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                Tables\Columns\TextColumn::make('title')
                    ->sortable()
                    ->searchable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Category')
                    ->sortable()
                    ->badge(),
                Tables\Columns\TextColumn::make('creator.full_name')
                    ->label('Creator')
                    ->sortable(),
                Tables\Columns\TextColumn::make('questions_count')
                    ->label('Questions')
                    ->counts('questions')
                    ->badge()
                    ->color('success'),
                Tables\Columns\TextColumn::make('source_type')
                    ->sortable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'TEXT' => 'gray',
                        'FILE' => 'info',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('Category')
                    ->relationship('category', 'name'),
                Tables\Filters\SelectFilter::make('source_type')
                    ->options([
                        'TEXT' => 'Text',
                        'FILE' => 'File',
                    ]),
                Tables\Filters\SelectFilter::make('creator_id')
                    ->label('Creator')
                    ->relationship('creator', 'full_name'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->label('View Details'),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ])
            ->defaultSort('id', 'desc');
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Quiz Information')
                    ->schema([
                        Infolists\Components\Grid::make(2)
                            ->schema([
                                Infolists\Components\TextEntry::make('title')
                                    ->weight('bold')
                                    ->size('lg'),
                                Infolists\Components\TextEntry::make('category.name')
                                    ->label('Category')
                                    ->badge(),
                                Infolists\Components\TextEntry::make('creator.full_name')
                                    ->label('Creator'),
                                Infolists\Components\TextEntry::make('source_type')
                                    ->badge(),
                                Infolists\Components\TextEntry::make('description')
                                    ->columnSpanFull(),
                                Infolists\Components\TextEntry::make('summary')
                                    ->columnSpanFull(),
                            ]),
                    ]),

                Infolists\Components\Section::make('Questions & Answers')
                    ->schema([
                        Infolists\Components\RepeatableEntry::make('questions')
                            ->schema([
                                Infolists\Components\Grid::make(3)
                                    ->schema([
                                        Infolists\Components\TextEntry::make('question_type')
                                            ->badge()
                                            ->color(fn (string $state): string => match ($state) {
                                                'MULTIPLE_CHOICE' => 'success',
                                                'TRUE_FALSE' => 'warning',
                                                'SHORT_ANSWER' => 'info',
                                            }),
                                        Infolists\Components\TextEntry::make('points')
                                            ->suffix(' pts'),
                                        Infolists\Components\TextEntry::make('time_limit')
                                            ->suffix(' seconds')
                                            ->placeholder('No limit'),
                                    ]),
                                Infolists\Components\TextEntry::make('question_text')
                                    ->label('Question')
                                    ->columnSpanFull()
                                    ->weight('bold'),
                                Infolists\Components\RepeatableEntry::make('answers')
                                    ->label('Answers')
                                    ->schema([
                                        Infolists\Components\TextEntry::make('answer_text')
                                            ->label('')
                                            ->formatStateUsing(function ($state, $record) {
                                                $icon = $record->is_correct ? '✅' : '❌';
                                                return $icon . ' ' . $state;
                                            })
                                            ->color(fn ($record): string => $record->is_correct ? 'success' : 'gray'),
                                    ])
                                    ->columns(1)
                                    ->columnSpanFull(),
                            ])
                            ->columns(1),
                    ]),
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
            'index' => Pages\ListQuizManagement::route('/'),
            'create' => Pages\CreateQuizManagement::route('/create'),
            'view' => Pages\ViewQuizManagement::route('/{record}'),
            'edit' => Pages\EditQuizManagement::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['questions.answers', 'category', 'creator']);
    }
}