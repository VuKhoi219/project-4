<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAnswerDetail extends Model
{
    use HasFactory;

    // Nếu bảng trong DB là 'user_answer_detail' thì giữ nguyên
    // Nếu thực tế là 'user_answer_details' thì phải sửa lại
    protected $table = 'user_answer_detail';

    public $timestamps = false;

    protected $fillable = [
        'user_answer_id',
        'answer_id',
    ];

    protected $casts = [
        'user_answer_id' => 'integer',
        'answer_id'      => 'integer',
    ];

    /**
     * Chi tiết này thuộc về 1 lần trả lời (UserAnswer)
     */
    public function userAnswer()
    {
        return $this->belongsTo(UserAnswer::class, 'user_answer_id');
    }

    /**
     * Chi tiết này tham chiếu đến 1 đáp án cụ thể
     */
    public function answer()
    {
        return $this->belongsTo(Answer::class, 'answer_id');
    }

    /**
     * Shortcut: Câu hỏi của đáp án này (thông qua Answer -> Question)
     */
    public function question()
    {
        return $this->hasOneThrough(
            Question::class, // model cuối
            Answer::class,   // model trung gian
            'id',            // PK ở answers
            'id',            // PK ở questions
            'answer_id',     // FK trong user_answer_detail
            'question_id'    // FK trong answers
        );
    }
}
