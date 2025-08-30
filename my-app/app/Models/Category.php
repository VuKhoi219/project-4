<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    public $timestamps = false;  // <-- thêm dòng này
    protected $fillable = [
        'name',
        'description',
    ];
    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}
