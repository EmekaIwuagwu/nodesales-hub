using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels.Base
{
    public abstract partial class BaseViewModel : ObservableObject
    {
        [ObservableProperty]
        private bool _isBusy;

        [ObservableProperty]
        private string _title = string.Empty;

        [ObservableProperty]
        private string _errorMessage = string.Empty;

        [ObservableProperty]
        private bool _hasError;

        protected async Task ExecuteSafeAsync(Func<Task> action, string errorMsg = "An error occurred")
        {
            try
            {
                IsBusy = true;
                HasError = false;
                ErrorMessage = string.Empty;
                await action();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"{errorMsg}: {ex.Message}";
                HasError = true;
                // Log to analytics here
                Console.WriteLine($"Error in {GetType().Name}: {ex}");
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
