<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'username' => fake()->name(),  // đổi từ name -> username
            'email' => fake()->unique()->safeEmail(),
            'password' => bcrypt('123456'), 
        ];
    }
}
