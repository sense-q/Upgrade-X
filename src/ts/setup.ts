export function setup(ctx: Modding.ModContext): void {
  // Define the upgrade button and its methods
  const upgradeBtn = {
    $template: '#upgrade-x',
    quantity: undefined as number | undefined,
    quantityEdit: '' as string,
    maxQuantity: 0 as number,
    clickUpgrade: undefined as (() => void) | undefined,
    isDowngrade: false as boolean,

    // Set the upgrade button action
    setClickUpgrade(upgradeBtn: () => void): void {
      this.clickUpgrade = upgradeBtn;
    },

    // Trigger the upgrade action
    upgrade() {
      this.clickUpgrade && this.clickUpgrade();
    },

    // Set and validate quantity value
    setQuantity(i: string): void {
      const num = parseInt(i, 10);
      if (num < 1 || isNaN(num)) {
        this.clearQuantity();
      } else {
        this.quantity = Math.min(num, this.maxQuantity);
        this.quantityEdit = this.quantity.toString();
      }
    },
    // Handle input changes
    onInput(event: Event): void {
      const i = (event.target as HTMLInputElement).value;
      /^[0-9]*$/.test(i)
        ? this.setQuantity(i)
        : (this.quantityEdit = this.quantity ? this.quantity.toString() : '');
    },

    // Reset quantity values
    clearQuantity(): void {
      this.quantity = undefined;
      this.quantityEdit = '';
    },

    // Set the maximum available quantity
    setMaxQuantity(maxQuantity: number): void {
      this.maxQuantity = maxQuantity;
    },

    // Toggle the downgrade state
    updateDowngrade(val: boolean): void {
      this.isDowngrade = val;
    },
  };

  ctx.onInterfaceReady(() => {
    // Append the new element
    const el = document.createElement('div');
    const divs = document.querySelectorAll(
      '#item-upgrade-menu > div:last-child > div:last-child',
    );
    const targetDiv = divs[divs.length - 1];
    targetDiv.appendChild(el);
    ui.create(upgradeBtn, el);

    // Set click action for the upgrade button
    const btn = document.getElementById('upgrade-x-btn');
    if (btn) upgradeBtn.setClickUpgrade(() => btn.click());

    // Patch the modal opening action to handle the upgrade or downgrade button state
    ctx.patch(Bank, 'fireItemUpgradeModal').before(function (
      this: Bank,
      s: any,
    ): void {
      upgradeBtn.clearQuantity();
      upgradeBtn.updateDowngrade(s.isDowngrade);
      upgradeBtn.setMaxQuantity(this.getMaxUpgradeQuantity(s));
      if (btn)
        btn.onclick = () => {
          upgradeBtn.quantity &&
            this.upgradeItemOnClick(s, upgradeBtn.quantity);
        };
    });
  });
}
