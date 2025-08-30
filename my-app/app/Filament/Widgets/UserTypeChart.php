<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;

class UserTypeChart extends ChartWidget
{
    protected static ?int $sort = 3;
    protected static ?string $heading = 'User Roles Distribution';
    
    protected static ?string $maxHeight = '300px';
    
    protected static ?string $pollingInterval = null;
     // Widget này nên chiếm 1/2 chiều rộng để nằm cạnh QuizCategoryChart
    protected int | string | array $columnSpan = [
        'default' => 'full',
        'md' => 1,
        'lg' => 1,
    ];

    protected function getData(): array
    {
        // Generate fake user role distribution for a balanced appearance
        $adminCount = rand(2, 3);
        $teacherCount = rand(19, 109);
        $studentCount = rand(192, 203);
        
        return [
            'datasets' => [
                [
                    'label' => 'User Types',
                    'data' => [$adminCount, $teacherCount, $studentCount],
                    'backgroundColor' => [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                    ],
                    'hoverOffset' => 4,
                ],
            ],
            'labels' => ['Admins', 'Teachers', 'Students'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}