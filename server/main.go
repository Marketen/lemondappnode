package main

import (
	"fmt"
	"log"
	"os"

	"github.com/go-resty/resty/v2"
	"github.com/spf13/cobra"
)

var (
	apiKey  string
	baseURL = "https://api.lemonsqueezy.com/v1"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "lemontool",
		Short: "Admin CLI to manage Lemon Squeezy licenses",
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			apiKey = os.Getenv("LEMON_API_KEY")
			if apiKey == "" {
				log.Fatal("LEMON_API_KEY env var is required")
			}
		},
	}

	rootCmd.AddCommand(validateCmd)
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(getCmd)
	rootCmd.AddCommand(updateCmd)
	rootCmd.AddCommand(cancelCmd)

	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}

var validateCmd = &cobra.Command{
	Use:   "validate [license_key]",
	Short: "Validate a license key",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		key := args[0]
		client := resty.New()
		resp, err := client.R().
			SetHeader("Authorization", "Bearer "+apiKey).
			SetHeader("Content-Type", "application/json").
			SetBody(map[string]string{"license_key": key}).
			Post(baseURL + "/licenses/validate")

		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(string(resp.Body()))
	},
}

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all licenses",
	Run: func(cmd *cobra.Command, args []string) {
		client := resty.New()
		resp, err := client.R().
			SetHeader("Authorization", "Bearer "+apiKey).
			Get(baseURL + "/licenses")

		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(string(resp.Body()))
	},
}

var getCmd = &cobra.Command{
	Use:   "get [license_id]",
	Short: "Get a specific license by ID",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		id := args[0]
		client := resty.New()
		resp, err := client.R().
			SetHeader("Authorization", "Bearer "+apiKey).
			Get(baseURL + "/licenses/" + id)

		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(string(resp.Body()))
	},
}

var updateCmd = &cobra.Command{
	Use:   "update [license_id]",
	Short: "Update license fields like expiry or activation limit",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		id := args[0]
		expires, _ := cmd.Flags().GetString("expires")
		limit, _ := cmd.Flags().GetInt("limit")

		data := map[string]interface{}{"license": map[string]interface{}{}}
		if expires != "" {
			data["license"].(map[string]interface{})["expires_at"] = expires
		}
		if limit > 0 {
			data["license"].(map[string]interface{})["activation_limit"] = limit
		}

		client := resty.New()
		resp, err := client.R().
			SetHeader("Authorization", "Bearer "+apiKey).
			SetHeader("Content-Type", "application/json").
			SetBody(data).
			Patch(baseURL + "/licenses/" + id)

		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(string(resp.Body()))
	},
}

var cancelCmd = &cobra.Command{
	Use:   "cancel-sub [subscription_id]",
	Short: "Cancel a subscription",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		id := args[0]
		client := resty.New()
		resp, err := client.R().
			SetHeader("Authorization", "Bearer "+apiKey).
			Post(baseURL + "/subscriptions/" + id + "/cancel")

		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(string(resp.Body()))
	},
}

func init() {
	updateCmd.Flags().String("expires", "", "Set license expiration date (RFC3339)")
	updateCmd.Flags().Int("limit", 0, "Set activation limit")
}
