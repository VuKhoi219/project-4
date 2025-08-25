<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'username',
        'email',
        'password_hash',
        'full_name',
        'is_active',
        'created_at',
        'updated_at',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Laravel Auth: dùng cột password_hash thay cho password
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * Vô hiệu hoá remember_token vì DB bạn không có cột này
     */
    public function getRememberTokenName()
    {
        return null;
    }

    public function getRememberToken()
    {
        return null;
    }

    public function setRememberToken($value)
    {
        // no-op
    }

    /**
     * ======================
     * FIX cho Filament
     * ======================
     * Trả về tên hiển thị luôn là string hợp lệ.
     */
    public function getFilamentName(): string
    {
        if (!empty($this->full_name)) {
            return (string) $this->full_name;
        }

        if (!empty($this->username)) {
            return (string) $this->username;
        }

        if (!empty($this->email)) {
            return (string) $this->email;
        }

        return 'Unknown User';
    }

    /**
     * Filament hiện tại gọi getUserName()
     * → ta redirect sang getFilamentName()
     */
    public function getUserName(): string
    {
        return $this->getFilamentName();
    }

    /**
     * Một số package/tiện ích mặc định của Filament/Laravel
     * expect thuộc tính "name"
     */
    public function getNameAttribute(): string
    {
        return $this->getFilamentName();
    }

    /**
     * Tuỳ chọn: serialize ra JSON cũng có field "name"
     */
    protected $appends = ['name'];
}
