@foreach ($wallets as $wallet)
    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-3">
        <div class="flex items-center gap-3">
            <x-filament::icon icon="heroicon-o-wallet" class="w-6 h-6 text-primary-600 dark:text-primary-500" />

            <div class="text-sm">
                <div class="font-semibold text-gray-900 dark:text-white capitalize">
                    {{ $wallet->provider }}
                </div>
                <div class="font-mono text-xs text-gray-600 dark:text-gray-300">
                    {{ $wallet->address }}
                </div>
            </div>
        </div>

        <div x-data="{ copied: false }" class="flex items-center space-x-1">
            <button
                type="button"
                @click="
                    navigator.clipboard.writeText('{{ $wallet->address }}');
                    copied = true;
                    setTimeout(() => copied = false, 2000);
                "
                class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition"
            >
                <x-filament::icon icon="heroicon-o-clipboard" class="w-5 h-5" />
            </button>
            <span
                x-show="copied"
                x-transition
                class="text-green-500 text-xs font-medium"
            >Tersalin!</span>
        </div>
    </div>
@endforeach
