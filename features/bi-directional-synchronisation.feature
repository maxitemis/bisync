Feature: Synchronisation

  Scenario: Legacy Data Changes Causing Changes On Remote Server
    When name in legacy database changed
    Then name in modernised database also changes

  Scenario: Modern Data Changes Causing Changes On Legacy Server
    When name in modern database changed
    Then name in legacy database also changes

  ##Scenario: Legacy D
  ##  When name in modern database changed
  ##  Then name in legacy database also changes
