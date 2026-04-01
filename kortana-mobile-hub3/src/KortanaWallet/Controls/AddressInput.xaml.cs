using System.Windows.Input;
using Nethereum.Util;

namespace KortanaWallet.Controls;

public partial class AddressInput : ContentView
{
	public AddressInput()
	{
		InitializeComponent();
	}

    public static readonly BindableProperty AddressProperty = 
        BindableProperty.Create(nameof(Address), typeof(string), typeof(AddressInput), string.Empty, BindingMode.TwoWay, propertyChanged: (b, o, n) => 
        {
            var control = (AddressInput)b;
            control.ValidateAddress();
        });

    public string Address
    {
        get => (string)GetValue(AddressProperty);
        set => SetValue(AddressProperty, value);
    }

    public static readonly BindableProperty ScanCommandProperty = 
        BindableProperty.Create(nameof(ScanCommand), typeof(ICommand), typeof(AddressInput), null);

    public ICommand ScanCommand
    {
        get => (ICommand)GetValue(ScanCommandProperty);
        set => SetValue(ScanCommandProperty, value);
    }

    private bool _isValid;
    public bool IsValid
    {
        get => _isValid;
        set { _isValid = value; OnPropertyChanged(); }
    }

    public ICommand PasteCommand => new Command(async () => 
    {
        if (Clipboard.HasText)
        {
            Address = await Clipboard.GetTextAsync();
            HapticFeedback.Default.Perform(HapticFeedbackType.Click);
        }
    });

    private void ValidateAddress()
    {
        if (string.IsNullOrEmpty(Address))
        {
            IsValid = false;
            return;
        }

        // Logic check for valid address
        IsValid = AddressUtil.Current.IsValidAddressLength(Address) && AddressUtil.Current.IsValidEthereumAddressHexFormat(Address);
    }
}
