<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Carbon\Carbon;

class QuizCompletionTrend extends ChartWidget
{
    protected static ?int $sort = 4;
    protected static ?string $heading = 'Quiz Completions Trend';
    
    protected static ?string $pollingInterval = null;
    // Widget này nên chiếm hết chiều rộng
    protected int | string | array $columnSpan = 'full';

    protected function getData(): array
    {
        // Generate dates for the last 7 days
        $dates = collect(range(6, 0))->map(function ($days) {
            return Carbon::now()->subDays($days)->format('Y-m-d');
        });
        
        // Generate fake completion data with an upward trend
        $baseValue = rand(10, 19);
        $completionCounts = [
            $baseValue,
            $baseValue + rand(-3, 5),
            $baseValue + rand(2, 8),
            $baseValue + rand(5, 10),
            $baseValue + rand(8, 15),
            $baseValue + rand(10, 20),
            $baseValue + rand(15, 25),
        ];
        
        // Format labels as readable dates
        $labels = $dates->map(function ($date) {
            return Carbon::parse($date)->format('M d');
        })->toArray();
        
        return [
            'datasets' => [
                [
                    'label' => 'Quiz Completions',
                    'data' => $completionCounts,
                    'fill' => 'start',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.2)',
                    'borderColor' => 'rgb(59, 130, 246)',
                    'tension' => 0.3,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}