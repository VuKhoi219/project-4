<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserManagementResource\Pages;
use App\Models\User;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use App\Models\FinalResult;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class UserManagementResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    
    protected static ?string $navigationLabel = 'User Management';
    
    protected static ?string $modelLabel = 'User Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User Information')
                    ->schema([
                        Forms\Components\TextInput::make('full_name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required()
                            ->unique(User::class, 'email', ignoreRecord: true),
                        Forms\Components\TextInput::make('username')
                            ->required()
                            ->maxLength(255)
                            ->unique(User::class, 'username', ignoreRecord: true),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                Tables\Columns\TextColumn::make('full_name')
                    ->sortable()
                    ->searchable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('email')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_quizzes_count')
                    ->label('Created Quizzes')
                    ->counts('createdQuizzes')
                    ->badge()
                    ->color('success'),
                Tables\Columns\TextColumn::make('final_results_count')
                    ->label('Quiz Attempts')
                    ->counts('finalResults')
                    ->badge()
                    ->color('info'),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Active'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active')
                    ->placeholder('All Users')
                    ->trueLabel('Active Users')
                    ->falseLabel('Inactive Users'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('User Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('id')
                            ->label('ID'),
                        Infolists\Components\TextEntry::make('full_name')
                            ->label('Name'),
                        Infolists\Components\TextEntry::make('email'),
                        Infolists\Components\TextEntry::make('username'),
                        Infolists\Components\IconEntry::make('is_active')
                            ->boolean()
                            ->label('Active'),
                        Infolists\Components\TextEntry::make('created_at')
                            ->dateTime(),
                        Infolists\Components\TextEntry::make('updated_at')
                            ->dateTime(),
                    ])
                    ->columns(2),

                Infolists\Components\Section::make('Statistics')
                    ->schema([
                        Infolists\Components\TextEntry::make('createdQuizzes.count')
                            ->label('Created Quizzes')
                            ->formatStateUsing(fn ($record) => $record->createdQuizzes()->count())
                            ->badge()
                            ->color('success'),
                        Infolists\Components\TextEntry::make('finalResults.count')
                            ->label('Quiz Attempts')
                            ->formatStateUsing(fn ($record) => $record->finalResults()->count())
                            ->badge()
                            ->color('warning'),
                        Infolists\Components\TextEntry::make('totalPoints')
                            ->label('Total Points')
                            ->formatStateUsing(fn ($record) => $record->finalResults()->sum('points'))
                            ->badge()
                            ->color('info'),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('Created Quizzes')
                    ->schema([
                        Infolists\Components\RepeatableEntry::make('createdQuizzes')
                            ->schema([
                                Infolists\Components\TextEntry::make('id')
                                    ->label('ID'),
                                Infolists\Components\TextEntry::make('title')
                                    ->url(fn ($record) => QuizManagementResource::getUrl('view', ['record' => $record]))
                                    ->color('primary'),
                            ])
                            ->columns(4)
                            ->visible(fn ($record) => $record->createdQuizzes()->count() > 0)
                    ]),

                Infolists\Components\Section::make('Quiz Attempts')
                    ->schema([
                        Infolists\Components\RepeatableEntry::make('finalResults')
                            ->schema([
                                Infolists\Components\TextEntry::make('id')
                                    ->label('ID'),
                                Infolists\Components\TextEntry::make('quiz.title')
                                    ->label('Quiz')
                                    ->url(fn ($record) => QuizManagementResource::getUrl('view', ['record' => $record->quiz]))
                                    ->color('primary'),
                                Infolists\Components\TextEntry::make('name_player')
                                    ->label('Player Name'),
                                Infolists\Components\TextEntry::make('points')
                                    ->label('Points')
                                    ->badge()
                                    ->color('success'),
                                Infolists\Components\TextEntry::make('created_at')
                                    ->label('Date')
                                    ->dateTime(),
                            ])
                            ->columns(5)
                            ->visible(fn ($record) => $record->finalResults()->count() > 0)
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
            'index' => Pages\ListUserManagement::route('/'),
            'create' => Pages\CreateUserManagement::route('/create'),
            'view' => Pages\ViewUserManagement::route('/{record}'),
            'edit' => Pages\EditUserManagement::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withCount(['createdQuizzes', 'finalResults']);
    }
}