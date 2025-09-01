<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AnswerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'answerText' => $this->faker->sentence(),
            'is_correct' => false,
            'orderIndex' => $this->faker->numberBetween(1, 4),
        ];
    }
}
