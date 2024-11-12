@wiki
Feature: open wikipedia, access a value, search details in it


  Scenario: Ottoman Empire
    When user search wikipedia for "ottoman empire"
    Then "Ottoman Empire" article pops in the results

    When accessing "Ottoman Empire" article from results
    Then article displays
      | title                      | number_of_chapters | number_of_References |
      | Ottoman Empire - Wikipedia | 49                 | 317                  |

