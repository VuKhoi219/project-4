<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;

class QuizCategoryChart extends ChartWidget
{
    protected static ?int $sort = 2;
    protected static ?string $heading = 'Quizzes by Category';
    
    protected static ?string $pollingInterval = null;
    // Widget này nên chiếm 1/2 chiều rộng để nằm cạnh UserTypeChart
    protected int | string | array $columnSpan = [
        'default' => 'full',
        'md' => 1,
        'lg' => 1,
    ];

    protected function getData(): array
    {
        // Generate fake quiz category data
        $labels = ['Math', 'Science', 'History', 'Literature', 'Languages', 'Computer Science'];
        $data = [
            rand(10, 19),
            rand(9, 12),
            rand(10, 20),
            rand(12, 22),
            rand(8, 18),
            rand(25, 40),
        ];
        
        return [
            'datasets' => [
                [
                    'label' => 'Number of Quizzes',
                    'data' => $data,
                    'backgroundColor' => [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 205, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                    ],
                    'borderColor' => [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(153, 102, 255)',
                        'rgb(255, 159, 64)',
                    ],
                    'borderWidth' => 1
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}