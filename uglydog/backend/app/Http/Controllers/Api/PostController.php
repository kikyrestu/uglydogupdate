<?php

namespace App\Http\Controllers\api;

use App\Models\Post;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;

class PostController extends Controller
{
    public function index()
    {
        $pengguna = Post::all();
        return PostResource::collection($pengguna);
    }
}
