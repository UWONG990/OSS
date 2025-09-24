<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'user_type',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'paypal_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'address' => 'array',
            'is_active' => 'boolean',
            'date_of_birth' => 'date',
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a buyer
     */
    public function isBuyer(): bool
    {
        return $this->user_type === 'buyer';
    }

    /**
     * Check if user is a seller
     */
    public function isSeller(): bool
    {
        return $this->user_type === 'seller';
    }

    /**
     * Get the user's shop (for sellers)
     */
    public function shop()
    {
        return $this->hasOne(Shop::class, 'owner_id');
    }

    /**
     * Check if seller has an approved shop
     */
    public function hasApprovedShop(): bool
    {
        return $this->shop && $this->shop->isApproved();
    }

    /**
     * Get the user's cart
     */
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * Get the user's orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
