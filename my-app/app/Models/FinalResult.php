<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinalResult extends Model
{
    protected $table = 'final_result';

    protected $fillable = [
        'user_id',
        'quiz_id',
        'name_player',
        'points',
    ];

    // Quan hệ tới User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ tới Quiz
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Quan hệ tới tất cả câu trả lời của user trong quiz này
     */
    public function userAnswers()
    {
        return $this->hasMany(UserAnswer::class, 'user_id', 'user_id')
                    ->forQuiz($this->quiz_id) // Sử dụng scope
                    ->with(['question.answers', 'details.answer'])
                    ->orderBy('question_id');
    }
}