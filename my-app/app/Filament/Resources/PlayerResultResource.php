<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PlayerResultResource\Pages;
use App\Models\FinalResult;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists\Infolist;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Illuminate\Database\Eloquent\Builder;

class PlayerResultResource extends Resource
{
    protected static ?string $model = FinalResult::class;

    protected static ?string $navigationIcon  = 'heroicon-o-user-circle';
    protected static ?string $navigationLabel = 'Player Results';
    protected static ?string $modelLabel      = 'Player Result';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name_player')
                ->label('Player Name')
                ->required(),

            Forms\Components\Select::make('user_id')
                ->relationship('user', 'name')
                ->label('User'),

            Forms\Components\Select::make('quiz_id')
                ->relationship('quiz', 'title')
                ->label('Quiz')
                ->required(),

            Forms\Components\TextInput::make('points')
                ->numeric()
                ->label('Total Points'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),

                Tables\Columns\TextColumn::make('name_player')
                    ->label('Player Name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('quiz.title')
                    ->label('Quiz')
                    ->sortable(),

                Tables\Columns\TextColumn::make('points')
                    ->label('Total Points')
                    ->sortable()
                    ->badge()
                    ->color('success'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->label('View Details'),
                
            ])
            
            ->defaultSort('id', 'desc');
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make('Player Information')
                ->schema([
                    TextEntry::make('name_player')->label('Tên người chơi'),
                    TextEntry::make('quiz.title')->label('Quiz'),
                    TextEntry::make('points')->label('Tổng điểm'),
                ])
                ->columns(3),

            Section::make('Questions & Answers')
                ->schema([
                    RepeatableEntry::make('quiz.questions')
                        ->schema([
                            // Câu hỏi
                            TextEntry::make('question_text')
                                ->label('Câu hỏi')
                                ->weight('bold')
                                ->columnSpanFull(),

                            // Danh sách đáp án
                            RepeatableEntry::make('answers')
                                ->schema([
                                    TextEntry::make('answer_text')
                                        ->label('')
                                        ->formatStateUsing(fn($state, $record) =>
                                            ($record->is_correct ? '✅ ' : '⬜ ') . $state
                                        ),
                                ])
                                ->columnSpanFull(),

                            // SỬA PHẦN NÀY: Đáp án người chơi chọn
    //                         TextEntry::make('user_selected_answers')
    // ->label('Người chơi chọn')
    // ->formatStateUsing(function ($state, $record) use ($infolist) {
    //     $finalResult = $infolist->getRecord();
    //     // Tìm UserAnswer từ userAnswers đã preload
    //     $userAnswer = $finalResult->userAnswers->firstWhere('question_id', $record->id);
        
    //     if (!$userAnswer || !$userAnswer->details || $userAnswer->details->isEmpty()) {
    //         return '❌ Chưa trả lời';
    //     }
        
    //     $selectedAnswers = $userAnswer->details->map(function ($detail) {
    //         if ($detail->answer) {
    //             $icon = $detail->answer->is_correct ? '✅' : '❌';
    //             return $icon . ' ' . $detail->answer->answer_text . ' (ID: ' . $detail->answer_id . ')';
    //         }
    //         return null;
    //     })->filter()->implode('<br>');
        
    //     return $selectedAnswers ?: '❌ Chưa trả lời';
    // })
    // ->html()
    // ->columnSpanFull(),
                            
                        ])
                        ->columns(1),
                ]),
        ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListPlayerResults::route('/'),
            'view'   => Pages\ViewPlayerResult::route('/{record}'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with([
            'quiz.questions.answers',
            'user',
            'userAnswers.details.answer', // Thêm load quan hệ này
            'userAnswers.question'
        ]);
    }
}