<?php
namespace App\Filament\Resources;

use App\Filament\Resources\FinalResultManagementResource\Pages;
use App\Models\FinalResult;
use App\Models\User;
use App\Models\Quiz;
use Filament\Forms;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Resources\Resource;
use Filament\Infolists;
use Filament\Infolists\Infolist;

class FinalResultManagementResource extends Resource
{
    protected static ?string $model = FinalResult::class;

    // Icon hiển thị trong menu Filament
    protected static ?string $navigationIcon = 'heroicon-o-trophy';
    
    protected static ?string $navigationLabel = 'Results Management';
    
    protected static ?string $modelLabel = 'Quiz Results';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                Tables\Columns\TextColumn::make('name_player')
                    ->label('Player Name')
                    ->sortable()
                    ->searchable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('quiz.title')
                    ->label('Quiz')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.full_name')
                    ->label('User')
                    ->sortable(),
                Tables\Columns\TextColumn::make('points')
                    ->sortable()
                    ->badge()
                    ->color('success'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('quiz_id')
                    ->label('Quiz')
                    ->relationship('quiz', 'title'),
                Tables\Filters\Filter::make('name_player')
                    ->form([
                        Forms\Components\TextInput::make('name_player')
                            ->label('Player Name'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query->when(
                            $data['name_player'],
                            fn ($query) => $query->where('name_player', 'like', "%{$data['name_player']}%")
                        );
                    }),
                Tables\Filters\Filter::make('points')
                    ->form([
                        Forms\Components\TextInput::make('points_min')
                            ->label('Minimum Points')
                            ->numeric(),
                        Forms\Components\TextInput::make('points_max')
                            ->label('Maximum Points')
                            ->numeric(),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when(
                                $data['points_min'],
                                fn ($query) => $query->where('points', '>=', $data['points_min'])
                            )
                            ->when(
                                $data['points_max'],
                                fn ($query) => $query->where('points', '<=', $data['points_max'])
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                // No bulk actions as per requirements
            ])
            ->defaultSort('id', 'desc');
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Result Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('id')
                            ->label('ID'),
                        Infolists\Components\TextEntry::make('name_player')
                            ->label('Player Name')
                            ->weight('bold'),
                        Infolists\Components\TextEntry::make('points')
                            ->badge()
                            ->color('success'),
                    ])
                    ->columns(2),

                Infolists\Components\Section::make('Quiz Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('quiz.id')
                            ->label('Quiz ID'),
                        Infolists\Components\TextEntry::make('quiz.title')
                            ->label('Quiz Title')
                            ->weight('bold')
                            ->url(fn ($record) => QuizManagementResource::getUrl('view', ['record' => $record->quiz])),
                        Infolists\Components\TextEntry::make('quiz.category.name')
                            ->label('Category')
                            ->badge(),
                    ])
                    ->columns(2),

                Infolists\Components\Section::make('User Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('user.id')
                            ->label('User ID'),
                        Infolists\Components\TextEntry::make('user.full_name')
                            ->label('User Name')
                            ->weight('bold'),
                        Infolists\Components\TextEntry::make('user.email')
                            ->label('Email'),
                    ])
                    ->columns(2)
                    ->visible(fn ($record) => $record->user !== null),
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
            'index' => Pages\ListFinalResultManagement::route('/'),
            'view' => Pages\ViewFinalResultManagement::route('/{record}'),
        ];
    }
}