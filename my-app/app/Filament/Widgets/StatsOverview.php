<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\FinalResult;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;
    protected static ?string $pollingInterval = null;
    // Widget này nên chiếm hết chiều rộng
    protected int | string | array $columnSpan = 'full';

    protected function getStats(): array
    {
        // Số liệu người dùng đang hoạt động với biến động ngẫu nhiên
        $activeUsers = rand(109, 191);
        $usersIncrease = rand(10, 19);
        
        // Tổng số bài kiểm tra với tăng trưởng ngẫu nhiên
        $totalQuizzes = rand(109, 200);
        $quizzesIncrease = rand(10, 19);
        
        // Số lần hoàn thành bài kiểm tra
        $quizCompletions = rand(19, 109);
        $completionsIncrease = rand(20, 30);
        
        return [
            Stat::make('Active users', $activeUsers)
                ->description($usersIncrease . '% increase')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success')
                ->chart([7, 2, 10, 3, 15, 4, 17])
                ->extraAttributes([
                    'class' => 'cursor-pointer',
                ]),
                
            Stat::make('Total number of tests', $totalQuizzes)
                ->description($quizzesIncrease . '% increase')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('primary')
                ->chart([3, 5, 7, 6, 8, 10, 15])
                ->extraAttributes([
                    'class' => 'cursor-pointer',
                ]),
                
            Stat::make('Exam turn', $quizCompletions)
                ->description($completionsIncrease . '% increase')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('warning')
                ->chart([15, 12, 10, 18, 22, 25, 30])
                ->extraAttributes([
                    'class' => 'cursor-pointer',
                ]),
        ];
    }
}