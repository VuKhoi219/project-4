<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('vi_VN');

        // ===== 1. Tạo 20 user =====
        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'username' => "user$i",
                'full_name' => $faker->name,
                'email' => "user$i@example.com",
                'password_hash' => Hash::make('123456'),
                'is_active' => 1,
            ]);
        }

        // ===== 2. Tạo 5 category =====
        $categoryNames = ['Toán học', 'Văn học', 'Lịch sử', 'Địa lý', 'Công nghệ'];
        foreach ($categoryNames as $cat) {
            Category::create([
                'name' => $cat,
                'description' => $faker->sentence(6, true),
            ]);
        }
        // ===== 3. Tạo 20 quiz =====
        $categories = Category::all();
        $users = User::all();

        for ($i = 1; $i <= 20; $i++) {
            $quiz = Quiz::create([
                'title'       => "Bài kiểm tra " . $faker->words(2, true),
                'description' => $faker->optional()->sentence(8, true), // có thể null
                'summary'     => $faker->optional()->sentence(10, true), // có thể null
                'avatar'      => $faker->imageUrl(200, 200, 'education', true, 'Quiz'), 
                'source_type' => $faker->randomElement(['FILE', 'TEXT']), // enum bắt buộc
                'category_id' => $categories->random()->id ?? null, // tránh lỗi nếu rỗng
                'creator_id'  => $users->random()->id ?? null,
                'file_id'     => null,
            ]);

    // ===== 4. Mỗi quiz có 5 câu hỏi & 4 đáp án =====
            for ($q = 1; $q <= 5; $q++) {
                $question = Question::create([
                    'quiz_id'       => $quiz->id,
                    'question_text' => $faker->sentence(10, true),
                    'order_index'   => $q,                // nếu muốn đánh số thứ tự
                    'points'        => 1,                 // hoặc random: rand(1,5)
                    'question_type' => 'multiple_choice', // nếu bạn dùng enum loại câu hỏi
                    'time_limit'    => 30,                // hoặc null nếu không bắt buộc
                    ]);
                $correctIndex = rand(1, 4);
                for ($a = 1; $a <= 4; $a++) {
                    Answer::create([
                        'question_id' => $question->id,
                        'answer_text' => $faker->sentence(5, true),
                        'is_correct'  => $a === $correctIndex,
                        'order_index' => $a,
                        'created_at'  => now(),
                    ]);
                }
            }
        }
    }
}