<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAnswer extends Model
{
    use HasFactory;

    protected $table = 'user_answer';
    public $timestamps = false;

    protected $fillable = [
        'room',
        'user_id',
        'question_id',
        'score',
    ];

    protected $casts = [
        'user_id'     => 'integer',
        'question_id' => 'integer',
        'score'       => 'integer',
        'room'        => 'string',
    ];

    /**
     * Scope để lọc UserAnswer theo quiz_id
     */
    public function scopeForQuiz($query, $quizId)
    {
        return $query->whereHas('question', function ($q) use ($quizId) {
            $q->where('quiz_id', $quizId);
        });
    }

    /**
     * Một lần trả lời có nhiều chi tiết (các đáp án mà user chọn)
     */
    public function details()
    {
        return $this->hasMany(UserAnswerDetail::class, 'user_answer_id')
                    ->with('answer');
    }

    /**
     * Lần trả lời này thuộc về một user
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Lần trả lời này thuộc về một câu hỏi
     */
    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id')
                    ->with('answers');
    }

    /**
     * Lấy quiz thông qua question
     */
    public function quiz()
    {
        return $this->hasOneThrough(
            Quiz::class,
            Question::class,
            'id',
            'id',
            'question_id',
            'quiz_id'
        );
    }
}