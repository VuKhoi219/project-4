<?php

namespace App\Filament\Widgets;

use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use App\Models\FinalResult;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class LatestQuizResults extends BaseWidget
{
    protected static ?int $sort = 5;
    protected static ?string $heading = 'Latest Quiz Results';
    
    protected int | string | array $columnSpan = 'full';
    
    // Mảng lưu trữ dữ liệu giả
    protected $fakeData = [];

    // Khởi tạo dữ liệu giả
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->fakeData = $this->generateFakeData();
    }

    // Tạo dữ liệu giả
    protected function generateFakeData(): array
    {
        $quizTitles = [
            'Math Fundamentals',
            'Science Quiz',
            'History Challenge',
            'Programming Basics',
            'Language Test'
        ];
        
        $playerNames = [
            'John Smith',
            'Sarah Johnson',
            'Michael Brown',
            'Emily Davis',
            'David Wilson'
        ];
        
        $data = [];
        for ($i = 0; $i < 5; $i++) {
            $data[] = [
                'id' => $i + 1,
                'name_player' => $playerNames[array_rand($playerNames)],
                'quiz' => ['title' => $quizTitles[array_rand($quizTitles)]],
                'points' => rand(7500, 9800),
                'created_at' => Carbon::now()->subHours(rand(1, 72)),
            ];
        }
        
        return $data;
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(
                FinalResult::query()
            )
            ->modifyQueryUsing(function (Builder $query) {
                // Không truy vấn database thực tế
                return $query->whereRaw('1 = 0');
            })
            ->columns([
                Tables\Columns\TextColumn::make('name_player')
                    ->label('Player')
                    ->searchable(),
                Tables\Columns\TextColumn::make('quiz.title')
                    ->label('Quiz')
                    ->searchable(),
                Tables\Columns\TextColumn::make('points')
                    ->label('Score')
                    ->sortable()
                    ->badge()
                    ->color('success'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Completed')
                    ->dateTime()
                    ->sortable(),
            ])
            ->emptyStateHeading('Loading quiz results...')
            ->emptyStateIcon('heroicon-o-academic-cap');
    }

    // Override render để hiển thị dữ liệu giả
    public function getTableRecords(): Collection
    {
        // Tạo collection từ dữ liệu giả
        $records = new Collection();
        
        foreach ($this->fakeData as $item) {
            // Tạo model giả từ mảng
            $record = new class extends Model {
                protected $guarded = [];
                
                public function quiz() {
                    return $this->belongsTo(Quiz::class);
                }
            };
            
            // Gán dữ liệu cho model
            $record->forceFill($item);
            $record->quiz = (object)$item['quiz'];
            
            $records->push($record);
        }
        
        return $records;
    }
}