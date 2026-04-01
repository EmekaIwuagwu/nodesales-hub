using System.Windows.Input;

namespace KortanaWallet.Controls;

public partial class PinPad : ContentView
{
	public PinPad()
	{
		InitializeComponent();
	}

    public static readonly BindableProperty PinProperty = 
        BindableProperty.Create(nameof(Pin), typeof(string), typeof(PinPad), string.Empty, BindingMode.TwoWay);

    public string Pin
    {
        get => (string)GetValue(PinProperty);
        set => SetValue(PinProperty, value);
    }

    public static readonly BindableProperty MaxLengthProperty = 
        BindableProperty.Create(nameof(MaxLength), typeof(int), typeof(PinPad), 6);

    public int MaxLength
    {
        get => (int)GetValue(MaxLengthProperty);
        set => SetValue(MaxLengthProperty, value);
    }

    public static readonly BindableProperty BiometricCommandProperty = 
        BindableProperty.Create(nameof(BiometricCommand), typeof(ICommand), typeof(PinPad), null);

    public ICommand BiometricCommand
    {
        get => (ICommand)GetValue(BiometricCommandProperty);
        set => SetValue(BiometricCommandProperty, value);
    }

    public ICommand ButtonCommand => new Command<string>((digit) => 
    {
        if (Pin.Length < MaxLength)
        {
            Pin += digit;
            HapticFeedback.Default.Perform(HapticFeedbackType.Click);
        }
    });

    public ICommand BackspaceCommand => new Command(() => 
    {
        if (Pin.Length > 0)
        {
            Pin = Pin.Substring(0, Pin.Length - 1);
            HapticFeedback.Default.Perform(HapticFeedbackType.Click);
        }
    });
}
