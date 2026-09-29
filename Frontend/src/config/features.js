/**
 * Modules a deployment can switch on without its own branch.
 *
 * Several sites run this same code from `main`. A branch per site would drift
 * -- every fix to main merged by hand, and one site eventually missing one --
 * so a site opts in through its build settings (Frontend/.env.production)
 * instead.
 */
