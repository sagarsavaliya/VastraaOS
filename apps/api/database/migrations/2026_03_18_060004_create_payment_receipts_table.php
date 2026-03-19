<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->integer('file_size')->unsigned();
            $table->string('mime_type', 100);
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('payment_id');
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_receipts');
    }
};
